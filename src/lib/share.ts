/**
 * Compartir una URL usando Web Share API (nativa del celular)
 * con fallback a copiar al portapapeles.
 * Retorna 'shared', 'copied' o 'error'
 */
export const shareOrCopy = async (title: string, text: string, url: string): Promise<'shared' | 'copied' | 'error'> => {
  try {
    if (navigator.share && navigator.canShare && navigator.canShare({ url })) {
      await navigator.share({ title, text, url })
      return 'shared'
    }
    // Fallback: copiar al portapapeles
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      return 'copied'
    }
    // Último fallback: execCommand
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return 'copied'
  } catch (e) {
    // Si el usuario cancela el share native, no es un error real
    if (e instanceof Error && e.name === 'AbortError') return 'shared'
    return 'error'
  }
}
