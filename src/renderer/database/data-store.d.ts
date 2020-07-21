
export interface DB {
  dbInsert(doc: any): void
  dbFind(query: Object): void
  dbUpdate(): void
}

declare module 'vue/types/vue' {
  interface Vue {
    $db: DB
  }
}
