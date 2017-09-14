# nqlx
Graph based state management.

# Why?
Manage Single Page Application's state is extremely hard. 

It is hard because there is so much state:
- UI state: information display on frontend, components' state, components's visibility so on.
- Domain state: information of business logic from server side, information of authentication and errors.
- Cache state: long lived domain state for effective client-server communication.

It is hard because there is os much component which consume and mutate different shared state.

It is hard because new requirements: optimistic updates, server-side rendering, early fetching data and so on.

Finally, real issue is managing ever-changing state. A simple state change could update a view and another state which might cause another view to update.

Some popular solutions try to fix the problem.
- Redux: single centralized store, immutable state and mutate state over action.
- Flux: inspired of CQRS pattern. Single write side (dispatcher) update multiple read side (stores). Redux is a strange implemented of CQRS pattern which single read side (immutable state) but able update by multiple reducers.
- Vuex: Vue based solution same with Redux, but use reactive state.
- Mobx: framework agnostic reactive state management.

Focus on mangement domain and cache state based on GraphQL
- Relay: declarative ui state which is also domain state based on GraphQL. Relay's most important concept is normal components desbribe what data it needed without worry how and when data fetched.
- Apollo-client: GraphQL client but also manage domain and cache state. 



