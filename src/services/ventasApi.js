const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function obtenerMensajeError(data, status) {
  if (data?.message) {
    return data.message
  }

  if (data?.mensaje) {
    return data.mensaje
  }

  if (data?.error) {
    return data.error
  }

  if (data?.errors) {
    const mensajes = Object.values(data.errors).flat()

    if (mensajes.length > 0) {
      return mensajes.join(' ')
    }
  }

  return `No se pudo procesar la solicitud. Código HTTP: ${status}`
}

export async function importarVentas(
  archivo,
  { signal, onProgress } = {}
) {
  if (!archivo) {
    throw new Error('Selecciona un archivo Excel.')
  }

  const extensionesPermitidas = ['xlsx', 'xls']

  const extension = archivo.name
    .split('.')
    .pop()
    ?.toLowerCase()

  if (!extensionesPermitidas.includes(extension)) {
    throw new Error(
      'El archivo debe tener formato XLSX o XLS.'
    )
  }

  const maximoBytes = 10 * 1024 * 1024

  if (archivo.size > maximoBytes) {
    throw new Error(
      'El archivo supera el tamaño máximo de 10 MB.'
    )
  }

  /*
   * XMLHttpRequest permite mostrar porcentaje real de subida.
   */
  return new Promise((resolve, reject) => {
    const formData = new FormData()

    formData.append('archivo', archivo)

    const xhr = new XMLHttpRequest()

    xhr.open(
      'POST',
      `${API_URL}/importaciones/ventas`
    )

    xhr.setRequestHeader(
      'Accept',
      'application/json'
    )

    xhr.upload.addEventListener(
      'progress',
      (event) => {
        if (
          event.lengthComputable &&
          typeof onProgress === 'function'
        ) {
          const porcentaje = Math.round(
            (event.loaded / event.total) * 100
          )

          onProgress(porcentaje)
        }
      }
    )

    xhr.addEventListener('load', () => {
      let data = null

      try {
        data = xhr.responseText
          ? JSON.parse(xhr.responseText)
          : null
      } catch {
        reject(
          new Error(
            'Laravel devolvió una respuesta que no es JSON.'
          )
        )

        return
      }

      /*
       * HTTP 207 también es una respuesta válida.
       * Laravel la utiliza cuando existen errores parciales.
       */
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data)
        return
      }

      const error = new Error(
        obtenerMensajeError(data, xhr.status)
      )

      error.status = xhr.status
      error.data = data

      reject(error)
    })

    xhr.addEventListener('error', () => {
      reject(
        new Error(
          'No fue posible conectarse con Laravel. Verifica que la API esté ejecutándose.'
        )
      )
    })

    xhr.addEventListener('abort', () => {
      reject(
        new DOMException(
          'La importación fue cancelada.',
          'AbortError'
        )
      )
    })

    if (signal) {
      if (signal.aborted) {
        xhr.abort()
        return
      }

      signal.addEventListener(
        'abort',
        () => xhr.abort(),
        { once: true }
      )
    }

    xhr.send(formData)
  })
}
