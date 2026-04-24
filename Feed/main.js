const api = new PostsApi()
const renderer = new FeedRenderer()
const app = new FeedApp(api, renderer)

app.run()
