import { makePersisted } from '@solid-primitives/storage'

import { createSignal } from 'solid-js'

import { User } from '~/types'

export const [authToken, setAuthToken] = makePersisted(createSignal(''), {
  name: 'authToken',
})

export const [user, setUser] = makePersisted(createSignal<User | null>(null), {
  name: 'user',
})
