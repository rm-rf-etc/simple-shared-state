# Weir

_An exciting and dramatically simplified approach to building modern web-based
applications._


## Frameworks
* Weir currently has bindings (via hooks API) for React. Bindings for Vue and Angular
are also planned.


## Install

Don't install this yet, it's not ready.


## Status
**_Currently in beta_**


## Feature Agenda
- [Dimensional Data Structures](https://github.com/rm-rf-etc/react-substrate/issues/3)
- [Dev-mode Index Dump/Reset](https://github.com/rm-rf-etc/react-substrate/issues/5)
- [Dev-mode Index Dump/Reset, Server-Side](https://github.com/rm-rf-etc/react-substrate/issues/6)
- [User Auth](https://github.com/rm-rf-etc/react-substrate/issues/7)
	- RBAC
	- User data - private
	- User data - public
- [Chat Messaging / Notifications](https://github.com/rm-rf-etc/react-substrate/issues/9)
- [Invite-Based Account Creation](https://github.com/rm-rf-etc/react-substrate/issues/8)


## Demo

Unavailable right now. Too many changes coming in too fast. Will update once ready.


## Dev Testing

If you are using `npm link` to develop the library and test in a local project,
you may encounter this error:
```
Invalid hook call. Hooks can only be called inside of the body of a function
component. This could happen for one of the following reasons
```

You simply need to link react in `react-substrate` to the react in your project.
https://github.com/facebook/react/issues/15315#issuecomment-479802153
