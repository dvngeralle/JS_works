class PostsApi {
  constructor() {
    this.baseUrl = "https://jsonplaceholder.typicode.com/posts"
    this.limit = 10
  }

  getPosts = async (page = 1, query = "") => {
    const url = new URL(this.baseUrl)
    url.searchParams.append("_page", page)
    url.searchParams.append("_limit", this.limit)
    if (query) {
      url.searchParams.append("q", query)
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Ошибка сети")
    }

    return await response.json()
  }
}
