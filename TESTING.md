# Approach to testing

In this app I'm trying to use a less brittle approach to e2e testing. That means being explicit about what e2e testing is verifying:

1. User interaction behaviour:
    - Leaving aside the details of the design you can enter an input field and interact with it (typing, navigating to new inputs, deleting etc.) and it will behave in an expected way - creating and linking notes.
2. How notes are rendered
    - Given an initial set of notes and a selected topic, the rendering should be consistent and predictable. We can afford some brittleness here if failures are easy to quickly understand and sense check but we should be alerted to changes to that might indicate regressions. Snapshot testing works well for this

We can achieve these goals by using our end to end tests to perform some interactions and then download some json representing the resulting state. We can then use this download to set the initial state for snapshot testing. That means we can change a great deal in terms of refactoring or re-desiging and only the snapshot tests will break (and only in the case of the latter). These are very easy to give a quick sense check to and can be updated with a single command.

This enables us to make very large refactors and as long as the user interaction behaviour is maintained (the same notes are produced) the tests will pass. We can fully integrate rxdb. Dry things up and much more without breaking tests (though server syncing will need to be tested separately)
