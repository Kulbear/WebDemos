let allWidgets = Widget.all()

let mapper = {
  'rounded_rect': ['width', 'height', 'bg', 'tc', 'bs', 'bc', 'sc', 'o', 'fs', 'lh'],
}

let topN = 5

let validScreen = MB.project().cscreens().map((e) => {
  return e['cid']
})

function inScreen(widget) {
  return validScreen.indexOf(widget['screen_cid']) != -1
}

filteredAllWidgets = allWidgets.filter(inScreen)

function buildStyleString(widgetName, mapper) {
  /* expected we have a mapper looks like
  {
    'rounded_rect': ['width', 'height', 'bg', 'tc', 'bs', 'bc', 'sc', 'o', 'fs', 'lh'],
    ...
  }
  */
  result = ``
  interestedProp = mapper[widgetName]

  // Consider this form of for-loop is a best practice...
  // Ref: http://stackoverflow.com/a/2265195/6670143
  for (let i = 0; i < interestedProp.length; i++) {
    result = `${result}\$\{e.${interestedProp[i]}},`
  }

  return result
}

function getTopNStyle(widgetName, allWidgets, N, mapper) {
  let stat = {}
  let arr = []
  let occur = []

  arr = filteredAllWidgets.filter((value) => {
    return value['name'] === widgetName
  })

  let mystr = buildStyleString(widgetName, mapper)
  arr = arr.map((e) => {
    // Avoid eval... For passing lint
    // return eval('`' + mystr + '`')
    let r = new Function('e', 'return `' + mystr + '`')
    return r(e)
  })

  arr.forEach((e) => {
    stat[e] = stat[e]
      ? stat[e] + 1
      : 1
  })

  for (let property in stat) {
    if (stat.hasOwnProperty(property)) {
      occur.push([property, stat[property]])
    }
  }

  occur.sort((a, b) => {
    if (a[1] > b[1]) {
      return -1
    }
    if (a[1] < b[1]) {
      return 1
    }
    return 0
  })

  return occur.length > N
    ? occur.slice(0, N)
    : occur
}

// Test
function performanceTest(widgetName, topN, testAmount) {
  let resultArr = []

  for (let i = 0; i < testAmount; i++) {
    let start = performance.now()
    getTopNStyle(widgetName, allWidgets, topN, mapper)
    let end = performance.now()
    let duration = end - start
    resultArr.push(duration)
    console.log(`Time cost for iteration ${i + 1} ==> ${duration | 0}ms`)
  }

  let sum = resultArr.reduce((a, b) => a + b)
  let average = sum / testAmount

  console.log(`Max time it takes for 1 iteration ==> ${Math.max(...resultArr) | 0}ms`)
  console.log(`Min time it takes for 1 iteration ==> ${Math.min(...resultArr) | 0}ms`)
  console.log(`Total time for ${testAmount} iterations ==> ${sum | 0}ms`)
  console.log(`Average time it takes for 1 iteration ${average | 0}ms`)
}

// Testing rounded_rect
// let testAmount = 10
// performanceTest('rounded_rect', topN, testAmount)

// For future multiple widgets implementation
let interestedWidget = ['rounded_rect']

let container = {}
interestedWidget.map((e) => container[e] = getTopNStyle(e, allWidgets, topN, mapper))


function buildWidgetStyle(styleArr, mapper, widgetName) {
  let widgetStyle = {}
  for (let i = 0; i < mapper[widgetName].length; i++) {
    widgetStyle[mapper[widgetName][i]] = styleArr[i]
  }
  return widgetStyle
}

function buildWidgetStyleObject(widgetName) {
  let styleObjects = container[widgetName].map((e) => {
    let styleArr = e[0].split(',')
    return buildWidgetStyle(styleArr, mapper, widgetName)
  })
  return styleObjects
}
buildWidgetStyleObject('rounded_rect')
