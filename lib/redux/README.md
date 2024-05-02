Argument for redux and rxdb together - some state shouldn't be stored in rxdb? e.g.

-   UI state

This is debatable

Redux gives us a sort of service layer? Separates logic from storage

-   Do we want to always mirror the rxdb state to redux? That's the issue. We can try the service layer approach

Going with Redux for now as I had the content api and I don't think we should be calling the service layer directly from components. Though maybe that's okay if there is no logic in the components...
