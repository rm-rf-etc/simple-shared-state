# Weir

_Auto-generate data bindings between react components and GUN DB nodes_

Weir provides auto-magical state management, with offline-first auto-synchronized
storage, as-needed relationships, and real-time updates, all in one convenient little
library. Simply wrap components and receive data.

## Install

`yarn add https://github.com/rm-rf-etc/react-substrate#latest`

## Status
**_Currently in beta_**

Current work is focused on developing a simplistic but flexible API around GUN DB's API,
along with advanced data types and convenience methods for all the major use cases.

## Feature Agenda
- [Enforcement Indices](https://github.com/rm-rf-etc/react-substrate/issues/2)
- [ND Data Structures](https://github.com/rm-rf-etc/react-substrate/issues/3)
- [Dev-mode Index Dump/Reset](https://github.com/rm-rf-etc/react-substrate/issues/5)
- [Dev-mode Index Dump/Reset, Server-Side](https://github.com/rm-rf-etc/react-substrate/issues/6)
- [Advanced Types Add-on API](https://github.com/rm-rf-etc/react-substrate/issues/4)
	- Data Structures rehydration
	- Data Structures method hooks
- [User Auth](https://github.com/rm-rf-etc/react-substrate/issues/7)
	- RBAC
	- User data - private
	- User data - public
- [Chat Messaging / Notifications](https://github.com/rm-rf-etc/react-substrate/issues/9)
- [Invite-Based Account Creation](https://github.com/rm-rf-etc/react-substrate/issues/8)


## Demo

Unavailable right now. Too many changes have been happening to the API.


## Dev Testing

If you are using `npm link` to develop the library and test in a local project,
you may encounter this error:
```
Invalid hook call. Hooks can only be called inside of the body of a function
component. This could happen for one of the following reasons
```

You simply need to link react in `react-substrate` to the react in your project.
https://github.com/facebook/react/issues/15315#issuecomment-479802153
