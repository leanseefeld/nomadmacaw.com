const LIST_REGEX = /^[-*]\s*/

const CONTEXT = { LIST: 'l', PARAGRAPH: 'p' }

function openContext (context, output) {
  if (!context) return
  switch (context) {
    case CONTEXT.PARAGRAPH:
      output.push('<p>')
      break
    case CONTEXT.LIST:
      output.push('<ul><li>')
      break
  }
}

function closeContext (context, output) {
  if (!context) return
  switch (context) {
    case CONTEXT.PARAGRAPH:
      output.push('</p>')
      break
    case CONTEXT.LIST:
      output.push('</li></ul>')
      break
  }
}

export function parse (content) {
  const output = ['<p>']
  let context = CONTEXT.PARAGRAPH

  for (let line of content) {
    line = line.replace(/\n/g, '<br/>')

    if (!line.trim()) {
      closeContext(context, output)
      context = null
    } else {
      if (LIST_REGEX.test(line)) {
        line = line.replace(LIST_REGEX, '')
        if (context === CONTEXT.LIST) {
          output.push('</li><li>')
        } else {
          closeContext(context, output)
          context = CONTEXT.LIST
          openContext(context, output)
        }
      } else if (!context) {
        context = CONTEXT.PARAGRAPH
        openContext(context, output)
      }
      output.push(line)
    }
  }
  return output.join('\n')
}
