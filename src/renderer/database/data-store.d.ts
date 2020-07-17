
export interface DB {
  dbInsert(doc: any): void
}

declare module 'vue/types/vue' {
  interface Vue {
    $db: DB
  }
}
