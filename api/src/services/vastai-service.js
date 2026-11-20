
module.exports = class VastAIService {
  async getMachine (vastInstanceId) {
    const response = await fetch(
      'https://console.vast.ai/api/v1/instances/?owner=me',
      {
        headers: {
          Authorization: `Bearer ${process.env.VAST_API_KEY}`
        }
      }
    )

    if (!response.ok) {
      const detalle = await response.text()
      throw new Error(
        `Vast.ai HTTP ${response.status}: ${detalle}`
      )
    }

    const data = await response.json()

    const candidates = data.instances.filter(i =>
      i.actual_status === 'running' &&
      i.ports?.['10001/tcp']?.[0]?.HostPort
    )

    const instance = vastInstanceId
      ? candidates.find(i => String(i.id) === vastInstanceId)
      : candidates.length === 1 ? candidates[0] : null

    if (!instance) {
      throw new Error(
        'No hay una instancia OCR única y operativa. ' +
        'Comprueba el puerto 10001 o indica VAST_INSTANCE_ID.'
      )
    }

    const ip = instance.public_ipaddr
    const port = instance.ports['10001/tcp'][0].HostPort

    if (!ip || !port) {
      throw new Error('IP o puerto público no disponible')
    }

    return `http://${ip}:${port}`
  }

  async checkModel(url, apiKey) {
    try{
      const response = await fetch(`${url}/ready`, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          `Vast.ai HTTP ${response.status}: ${detail}`
        );
      }

      return true
      
    }catch(error){
      console.log(error)
      return false
    }
  }
}
