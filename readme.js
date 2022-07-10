module.exports = () => {
	return `
# Headline Dataset

Dataset: [/headlines.json](https://raw.githubusercontent.com/fwd/news/main/headlines.json) file. 

File Size: ~**3MB** (+0.1MB per day)

```
[
    {
        "title": "3 dead, 2 injured after Amtrak train collides with car in California",
        "domain": "abcnews.go.com",
        "category": "news",
        "link": "https://abcnews.go.com/US/dead-injured-amtrak-collision-report/story?id=85761564",
        "timestamp": 1656308108,
        "sentiment": -6,
        "published": "June 27, 2022 1:35 AM"
    },
    ..
]
```

### Topics

- World News
- Technology
- Television
- Entertaiment
- Politics
- Sport
- More Coming Soon

---

### Contact 

Twitter: [@nano2dev](https://twitter.com/nano2dev)

## Github Stars

[![Stargazers over time](https://starchart.cc/fwd/news.svg)](https://starchart.cc/fwd/news)
	`
}