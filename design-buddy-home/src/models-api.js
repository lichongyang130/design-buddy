export async function modelRequest(action, body, signal) {
  if (body.apiKey && typeof window !== 'undefined' && window.location.protocol !== 'https:' && !['localhost','127.0.0.1','[::1]'].includes(window.location.hostname)) {
    throw Error('请通过 HTTPS 打开应用后再提交 API Key，本机调试除外')
  }
  let response
  try {
    response = await fetch(`/api/models/${action}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-DB-Client': 'design-buddy',
      },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw Error('当前尚未连接问答模型：无法连接应用后端，请检查服务和网络')
  }
  let result
  try {
    result = await response.json()
  } catch {
    throw Error('后端未返回有效 JSON，请重启最新版本的应用服务器')
  }
  if (!response.ok || !result.ok) throw Error(result.error || '模型请求失败')
  return result
}
