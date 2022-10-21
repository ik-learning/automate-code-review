**Describe the bug**

Current setup probably not the one recoomented.
Single repository with Danger job running. The job triggered through a webhook.
Hope this diagrams express it very well. We are running code reviews at a scale.
To speed up our review, and do not waist time if review was already given, our danger file looks like this

```js
const { danger, message, warn, fail, markdow } = require('danger');

if (!skipReview()) {
}
```

`skipReview` function does quick cheks, they not relevant to a current problem on high lelevel some rules to decide where or not to run a code review check

The issue is [here]()
```js
if (!hasMessages || this.options.removePreviousComments) {
  if (!hasMessages) {
    this.log(`Found no issues or messages from Danger. Removing any existing messages on ${this.platform.name}.`)
  } else {
    this.log(`'removePreviousComments' option specified. Removing any existing messages on ${this.platform.name}.`)
  }
  await this.platform.deleteMainComment(dangerID)
  const previousComments = await this.platform.getInlineComments(dangerID)
  for (const comment of previousComments) {
    if (comment && comment.ownedByDanger) {
      await this.deleteInlineComment(comment)
    }
  }
}
```

Basically when we skip a review, there are no messages, and previous comment is deleted.
`Found no issues or messages from Danger. Removing any existing messages on Gitlab.`

I understand a behaviour. Would it be possible to add an extra flag e.g. `skipCommentDeleetion`, `reuseCurrentComment` or something along this lines?

How its currently solved. Two jobs running. First check whether or not we should skip a review, and next job commence a review.

**To Reproduce**

On request. Gitlab and Gitlab CI access is required.

**Expected behavior**

Command `danger ci` does not remove previous Danger comments if there are no issues or messages.

**Screenshots**

Architecture

**Your Environment**
<!--- Include as many relevant details about the environment you experienced the bug in -->

 | software         | version
| ---------------- | -------
| danger.js        | 11.1.4
| node             | 18
| npm              | 8.19.1
| Operating System | Alpine(Docker)

**Additional context**

If there is a benefit, happy to create a documentation on hove to bake `Danger+Gitlab+WebHooks` at scale
