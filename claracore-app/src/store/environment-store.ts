import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Environment, KeyValue } from '../types'

interface EnvironmentState {
  environments: Environment[]
  activeEnvironmentId: string | null

  addEnvironment: (name: string) => void
  updateEnvironment: (id: string, name: string) => void
  deleteEnvironment: (id: string) => void
  setActiveEnvironment: (id: string | null) => void
  addVariable: (environmentId: string) => void
  updateVariable: (environmentId: string, variableId: string, key: string, value: string, enabled: boolean) => void
  removeVariable: (environmentId: string, variableId: string) => void
  getActiveEnvironment: () => Environment | null
  getVariables: () => Record<string, string>
}

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set, get) => ({
      environments: [],
      activeEnvironmentId: null,

      addEnvironment: (name) =>
        set((state) => ({
          environments: [
            ...state.environments,
            {
              id: uuidv4(),
              name,
              variables: [],
              isActive: false,
            },
          ],
        })),

      updateEnvironment: (id, name) =>
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === id ? { ...e, name } : e
          ),
        })),

      deleteEnvironment: (id) =>
        set((state) => ({
          environments: state.environments.filter((e) => e.id !== id),
          activeEnvironmentId: state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
        })),

      setActiveEnvironment: (id) =>
        set({ activeEnvironmentId: id }),

      addVariable: (environmentId) =>
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === environmentId
              ? {
                  ...e,
                  variables: [
                    ...e.variables,
                    { id: uuidv4(), key: '', value: '', enabled: true },
                  ],
                }
              : e
          ),
        })),

      updateVariable: (environmentId, variableId, key, value, enabled) =>
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === environmentId
              ? {
                  ...e,
                  variables: e.variables.map((v) =>
                    v.id === variableId ? { ...v, key, value, enabled } : v
                  ),
                }
              : e
          ),
        })),

      removeVariable: (environmentId, variableId) =>
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === environmentId
              ? {
                  ...e,
                  variables: e.variables.filter((v) => v.id !== variableId),
                }
              : e
          ),
        })),

      getActiveEnvironment: () => {
        const { environments, activeEnvironmentId } = get()
        return environments.find((e) => e.id === activeEnvironmentId) || null
      },

      getVariables: () => {
        const env = get().getActiveEnvironment()
        if (!env) return {}

        const vars: Record<string, string> = {}
        env.variables.forEach((v) => {
          if (v.enabled && v.key) {
            vars[v.key] = v.value
          }
        })
        return vars
      },
    }),
    {
      name: 'environment-storage',
    }
  )
)
