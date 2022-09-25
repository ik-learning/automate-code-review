if (jsAppFiles.length) {
  const listed = danger.github.utils.fileLinks(jsAppFiles)
  fail(`Please use <code>*.ts</code> for new files. Found: ${listed}.`)
}

const isTrivial = (danger.github.pr.body + danger.github.pr.title).includes("#trivial")

if no changes >>>
  danger.github.setSummaryMarkdown("Looking good")


console.log(danger.gitlab.utils.fileContents(file).then(d => { console.log(d) }));

const pr = danger.github.pr
const bodyAndTitle = (pr.body + pr.title).toLowerCase()

// Custom modifiers for people submitting PRs to be able to say "skip this"
const acceptedNoTests = bodyAndTitle.includes("#skip_new_tests")
const acceptedNoNativeChanges = bodyAndTitle.includes("#native_no_changes")
danger.git.commits.forEach(commit => {
  if (!commit.message.match(/^(feat:)|(fix:)|(major:)|(chore:)/g)) {
    fail(`Commit message '${commit.message}' does match the correct format`)
  }
})

const full = await danger.gitlab.utils.fileContents(file);
