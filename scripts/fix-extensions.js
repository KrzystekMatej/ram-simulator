const fs = require('fs')
const path = require('path')

const dir = './app/static/js'

// RegExp: import/export from "./něco" nebo '../něco'
const importExportRegex = /(import|export)\s+[^'"]*['"](\.\/[^'"]+|\.{2}\/[^'"]+)['"]/g

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')

  content = content.replace(importExportRegex, (match) => {
    if (match.endsWith('.js"') || match.endsWith(".js'")) return match
    return match.replace(/(['"])(\.[^'"]+)(['"])/, '$1$2.js$3')
  })

  fs.writeFileSync(filePath, content, 'utf-8')
}

function processDir(dirPath) {
  for (const file of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath)
    } else if (file.endsWith('.js')) {
      processFile(fullPath)
    }
  }
}

processDir(dir)
