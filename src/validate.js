"use strict";

class WebHookValidator {

  constructor(payload) {
    this._object = JSON.parse(payload)
    this.changes = this._object.changes
    this.user = this._object.user;
    this.object_kind = this._object.object_kind;
    this.event_type = this._object.event_type;
  }

  isBot() {
    return this.user === null || this.user !== null && this.user.username.includes('bot');
  }

  /**
   * Whether the even is a merge request.
   * @returns true of false
   */
  isNotAMergeRequest() {
    return this.object_kind !== 'merge_request' && this.event_type !== 'merge_request';
  }

  /**
   * Whether a description is updated or not.
   * @returns true or false
   */
  isOnlyDescriptionUpdated() {
    return 'description' in this.changes;
  }

  /**
   * Json pretty print string.
   * @returns string
   */
  toString() {
    return JSON.stringify(this._object, null, 2)
  }

}

module.exports = {
  WebHookValidator,
}
