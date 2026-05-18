const STORAGE_KEY = 'smartcanvas_social_data'

const templates = [
  { id: 1, title: 'Business Poster Template', type: 'Poster' },
  { id: 2, title: 'Instagram Story Template', type: 'Social Media' },
  { id: 3, title: 'Presentation Template', type: 'Presentation' },
  { id: 4, title: 'Marketing Flyer Template', type: 'Flyer' },
  { id: 5, title: 'Resume Design Template', type: 'Document' },
  { id: 6, title: 'Education Infographic Template', type: 'Infographic' }
]

const defaultData = {
  likes: [],
  favourites: [],
  ratings: [],
  schedule: []
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : defaultData
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getTemplates() {
  return templates
}

export function getSocialData() {
  return loadData()
}

export function toggleLike(userId, item) {
  const data = loadData()

  const index = data.likes.findIndex(
    like => like.userId === userId && like.itemId === item.id
  )

  if (index >= 0) {
    data.likes.splice(index, 1)
  } else {
    data.likes.push({
      userId,
      itemId: item.id,
      title: item.title,
      type: item.type,
      createdAt: new Date().toISOString()
    })
  }

  saveData(data)
}

export function toggleFavourite(userId, item) {
  const data = loadData()

  const index = data.favourites.findIndex(
    fav => fav.userId === userId && fav.itemId === item.id
  )

  if (index >= 0) {
    data.favourites.splice(index, 1)
  } else {
    data.favourites.push({
      userId,
      itemId: item.id,
      title: item.title,
      type: item.type,
      createdAt: new Date().toISOString()
    })
  }

  saveData(data)
}

export function rateTemplate(userId, item, score) {
  const data = loadData()

  const existing = data.ratings.find(
    rating => rating.userId === userId && rating.itemId === item.id
  )

  if (existing) {
    existing.score = score
    existing.updatedAt = new Date().toISOString()
  } else {
    data.ratings.push({
      userId,
      itemId: item.id,
      title: item.title,
      type: item.type,
      score,
      createdAt: new Date().toISOString()
    })
  }

  saveData(data)
}

export function generateSchedule(userId) {
  const data = loadData()

  const timeSlots = [
    'Monday 09:00 - 10:30',
    'Tuesday 11:00 - 12:30',
    'Wednesday 14:00 - 15:30',
    'Thursday 10:00 - 11:30',
    'Friday 13:00 - 14:30'
  ]

  const myFavourites = data.favourites.filter(fav => fav.userId === userId)

  const generated = myFavourites.map((item, index) => ({
    userId,
    itemId: item.itemId,
    title: item.title,
    type: item.type,
    time: timeSlots[index % timeSlots.length]
  }))

  data.schedule = data.schedule.filter(item => item.userId !== userId)
  data.schedule.push(...generated)

  saveData(data)
}

export function clearSchedule(userId) {
  const data = loadData()
  data.schedule = data.schedule.filter(item => item.userId !== userId)
  saveData(data)
}