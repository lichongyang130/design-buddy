// Same-origin OpenAI-compatible gateway. Credentials stay in short-lived server memory.
import https from 'node:https'
import { lookup } from 'node:dns/promises'
import { randomBytes } from 'node:crypto'
import { isIP } from 'node:net'

export function publicAddress(ip) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number)
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || b === 0 || b === 2)) ||
      (a === 198 && (b === 18 || b === 19 || b === 51)) ||
      (a === 203 && b === 0)
    )
  }
  return (
    isIP(ip) === 6 &&
    /^[23][0-9a-f]{3}:/i.test(ip) &&
    !/^2001:(?:db8|0):/i.test(ip)
  )
}
export function endpointFor(baseURL, allowedHosts) {
  let url
  try {
    url = new URL(baseURL)
  } catch {
    throw Error('接口地址无效')
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.port && url.port !== '443')
  )
    throw Error('接口必须使用 HTTPS 标准端口，且不能包含账号、查询参数或片段')
  if (!allowedHosts.includes(url.hostname))
    throw Error(
      '接口域名未获服务器许可。请由管理员配置 MODEL_ALLOWED_HOSTS 后重启服务',
    )
  url.pathname = url.pathname.replace(/\/+$/, '')
  if (!url.pathname.endsWith('/chat/completions'))
    url.pathname += '/chat/completions'
  return url
}
export async function requestCompletion({
  url,
  key,
  model,
  messages,
  test = false,
  maxTokens = 2048,
  signal,
  resolveHost = lookup,
  transport = https.request,
}) {
  const addresses = await resolveHost(url.hostname, { all: true })
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw Error('接口域名解析到受保护地址，已阻止请求')
  const address = addresses[0]
  const payload = JSON.stringify({
    model,
    messages,
    stream: false,
    max_tokens: test ? 32 : Math.min(4096, maxTokens),
  })
  return new Promise((resolve, reject) => {
    const req = transport(
      url,
      {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'Content-Length': Buffer.byteLength(payload),
        },
        lookup: (_host, opts, cb) =>
          opts.all
            ? cb(null, [address])
            : cb(null, address.address, address.family),
      },
      (res) => {
        let size = 0
        const chunks = []
        res.on('data', (chunk) => {
          size += chunk.length
          if (size > 2 * 1024 * 1024) {
            res.destroy()
            reject(Error('模型响应过大'))
          } else chunks.push(chunk)
        })
        res.on('error', () => reject(Error('模型响应读取失败')))
        res.on('end', () => {
          const status = res.statusCode
          if (status !== 200)
            return reject(
              Error(
                {
                  401: '认证失败：请检查 API Key',
                  403: '服务拒绝访问：请检查权限或地区限制',
                  404: '模型或接口地址不存在',
                  429: '请求过多或账户额度不足',
                }[status] || `模型服务返回 HTTP ${status}`,
              ),
            )
          try {
            const data = JSON.parse(Buffer.concat(chunks).toString()),
              message = data.choices?.[0]?.message
            const content = message?.content,
              reasoning = message?.reasoning_content
            if (typeof content === 'string' && content.trim())
              return resolve(content)
            if (test && typeof reasoning === 'string' && reasoning.trim())
              return resolve('reasoning response')
            reject(Error('服务未返回有效回答；请检查模型 ID，或提高输出上限'))
          } catch {
            reject(Error('模型服务未返回有效 JSON'))
          }
        })
      },
    )
    req.setTimeout(45000, () => req.destroy(Error('请求超时（45 秒）')))
    req.on('error', (error) =>
      reject(
        Error(
          error.message.includes('超时')
            ? '请求超时（45 秒）'
            : '模型服务网络连接失败，请检查网络出口、域名或防火墙',
        ),
      ),
    )
    req.end(payload)
  })
}
export function createModelHandler({
  env = process.env,
  completion = requestCompletion,
  now = Date.now,
} = {}) {
  const sessions = new Map(),
    rates = new Map()
  let active = 0
  const hosts = () => [
    ...new Set([
      'api.deepseek.com',
      'api.openai.com',
      // Explicitly approved custom provider for this workspace.
      'discovery-api.intern-ai.org.cn',
      ...(env.MODEL_ALLOWED_HOSTS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ]),
  ]
  return async function handle(req, res) {
    const json = (status, data) => {
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      })
      res.end(JSON.stringify(data))
    }
    let origin
    try {
      origin = new URL(req.headers.origin).host
    } catch {
      return json(403, { ok: false, error: '缺少同源 Origin' })
    }
    if (
      origin !== req.headers.host ||
      req.headers['x-db-client'] !== 'design-buddy'
    )
      return json(403, { ok: false, error: '跨源请求已拒绝' })
    if (
      req.method !== 'POST' ||
      !['/api/models/test', '/api/models/chat'].includes(req.url)
    )
      return json(404, { ok: false, error: '接口不存在' })
    const current = now()
    for (const [id, s] of sessions) if (s.expires < current) sessions.delete(id)
    for (const [id, r] of rates) if (r.until < current) rates.delete(id)
    const ip = req.socket.remoteAddress || 'unknown',
      rate = rates.get(ip) || { count: 0, until: current + 60000 }
    rate.count++
    rates.set(ip, rate)
    if (rate.count > 20 || active >= 4)
      return json(429, { ok: false, error: '请求过于频繁，请稍后重试' })
    active++
    const controller = new AbortController(),
      deadline = setTimeout(() => controller.abort(), 60000)
    res.on('close', () => {
      if (!res.writableEnded) controller.abort()
    })
    try {
      let size = 0
      const chunks = []
      for await (const chunk of req) {
        size += chunk.length
        if (size > 200000) throw Error('请求内容过大')
        chunks.push(chunk)
      }
      let body
      try {
        body = JSON.parse(Buffer.concat(chunks))
      } catch {
        throw Error('请求内容不是有效 JSON')
      }
      const config = body.config || {},
        model = String(config.modelId || '').trim()
      if (
        !model ||
        model.length > 150 ||
        /[\s<>]/.test(model) ||
        /^sk-/i.test(model)
      )
        throw Error('请填写正确的模型名称 / ID')
      const url = endpointFor(config.baseURL, hosts()),
        binding = model + '@' + url.href
      const cookie = String(req.headers.cookie || '').match(
        /(?:^|;\s*)db_model_session=([a-f0-9]{48})(?:;|$)/,
      )?.[1]
      const session = sessions.get(cookie)
      let key = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
      if (!key && session?.binding === binding) key = session.key
      if (!key) {
        if (url.hostname === 'api.deepseek.com')
          key = env.DEEPSEEK_API_KEY || ''
        else if (url.hostname === 'api.openai.com')
          key = env.OPENAI_API_KEY || ''
        if (
          !key &&
          env.MODEL_API_KEY &&
          env.MODEL_BASE_URL &&
          endpointFor(env.MODEL_BASE_URL, hosts()).origin === url.origin
        )
          key = env.MODEL_API_KEY
      }
      if (!key)
        throw Error(
          '尚无可用密钥：请在添加/编辑模型中输入 API Key 并测试连接，或配置服务器环境变量',
        )
      if (key.length > 8192 || /[\r\n]/.test(key))
        throw Error('API Key 格式无效')
      const test = req.url.endsWith('/test')
      const messages = test
        ? [{ role: 'user', content: 'Reply with OK.' }]
        : body.messages
      if (
        !Array.isArray(messages) ||
        !messages.length ||
        messages.length > 40 ||
        messages.some(
          (m) =>
            !['user', 'assistant'].includes(m.role) ||
            typeof m.content !== 'string' ||
            m.content.length > 12000,
        ) ||
        messages.reduce((n, m) => n + m.content.length, 0) > 64000
      )
        throw Error('消息内容无效或过长')
      const started = now()
      const text = await completion({
        url,
        key,
        model,
        messages,
        test,
        maxTokens:
          Number.isSafeInteger(config.outputLimit) && config.outputLimit > 0
            ? config.outputLimit
            : 2048,
        signal: controller.signal,
      })
      if (controller.signal.aborted) throw Error('请求已取消或超时')
      if (typeof text !== 'string' || !text.trim())
        throw Error('模型返回空回答')
      if (test) {
        if (!session && sessions.size >= 100)
          throw Error('临时连接数量已达上限，请稍后重试')
        const id = cookie && session ? cookie : randomBytes(24).toString('hex')
        sessions.set(id, { binding, key, expires: now() + 30 * 60000 })
        const secure =
          req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted
        res.setHeader(
          'Set-Cookie',
          `db_model_session=${id}; HttpOnly; SameSite=Strict; Path=/api/models; Max-Age=1800${secure ? '; Secure' : ''}`,
        )
        return json(200, {
          ok: true,
          latencyMs: now() - started,
          message:
            '连接成功：模型已返回有效响应。密钥仅在服务器内存保留 30 分钟，服务重启后失效。',
        })
      }
      return json(200, { ok: true, text })
    } catch (error) {
      return json(400, {
        ok: false,
        error: controller.signal.aborted
          ? '请求已取消或超时'
          : error.message &&
              /API|接口|域名|模型|响应|请求|服务|消息|连接|认证/.test(
                error.message,
              )
            ? error.message
            : '模型请求失败，请检查接口配置或网络',
      })
    } finally {
      clearTimeout(deadline)
      active--
    }
  }
}
export const handleModelRequest = createModelHandler()
