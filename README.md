# Untitled App for notes as a directed graph

-   I frequently find myself taking notes that have sub clauses/nested elaborations
-   Often these elaborations involve a relation type - support, opposition etc.
-   I might make the same note in two places. Let's make note text identity
-   Let's build a PWA where note taking in this way is not a hack

##

Use next, next-pwa, redux, rxdb, tailwind

redux stores UI state, RxDB syncs with Apollo server over graphql subscriptions and syncs with redux

Start by building the app server-free

Components won't manage their own state ever so snapshot testing is simplified

Business logic should live in redux and be tested there

Use a service layer as the only way to talk to RxDB

# Run the app

`yarn dev`

# Run tests

`yarn test`
