if (jsAppFiles.length) {
  const listed = danger.github.utils.fileLinks(jsAppFiles)
  fail(`Please use <code>*.ts</code> for new files. Found: ${listed}.`)
}

const isTrivial = (danger.github.pr.body + danger.github.pr.title).includes("#trivial")

if no changes >>>
  danger.github.setSummaryMarkdown("Looking good")


console.log(danger.gitlab.utils.fileContents(file).then(d => { console.log(d) }));
