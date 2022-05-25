let gamepadIndex, intervalID

const BUTTON = {
  LEFT: 0,
  DOWN: 1,
  UP: 2,
  RIGHT: 3,
  SL: 4,
  SR: 5,
  ZL: 6,
  L: 8,
  MINUS: 9,
  CAPTURE_BUTTON: 16,
}

const STICK = {
  LEFT: 0,
  DOWN: 1,
  UP: 2,
  RIGHT: 3,
}

const BUTTON_DOCUMENT_ID = {
  [BUTTON.LEFT]: 'left',
  [BUTTON.DOWN]: 'down',
  [BUTTON.UP]: 'up',
  [BUTTON.RIGHT]: 'right',
  [BUTTON.SL]: 'sl',
  [BUTTON.SR]: 'sr',
  [BUTTON.L]: 'l',
  [BUTTON.ZL]: 'zl',
  [BUTTON.MINUS]: 'minus',
  [BUTTON.CAPTURE_BUTTON]: 'capture',
}

const STICK_DOCUMENT_ID = {
  [STICK.LEFT]: 'stick-left',
  [STICK.DOWN]: 'stick-down',
  [STICK.UP]: 'stick-up',
  [STICK.RIGHT]: 'stick-right',
}

const VENDOR_ID = '57e'
const DEVICE_ID = '2006'

function dispatchKeyboardEvent(key) {
  const events = ['keydown', 'keyup']
  events.forEach(e => {
    document.body.dispatchEvent(new KeyboardEvent(e, { key, bubbles: true }))
  })
}

function setZLHighlight(id, highlight) {
  document.getElementById(id).style.opacity = highlight ? 0.5 : 0
  if (highlight) {
    document.getElementById(`field-${id}`).focus()
  }
}

function setButtonHighlight(id, highlight) {
  document.getElementById(id).style.backgroundColor = highlight ? '#ffeb3b' : '#222'
  if (highlight) {
    document.getElementById(`field-${id}`).focus()
  }
}

function setStickHighlight(id, highlight) {
  document.getElementById(id).style.backgroundColor = highlight ? '#ffeb3b' : '#666'
  if (highlight) {
    document.getElementById(`field-${id}`).focus()
  }
}

addEventListener('gamepadconnected', async ({ gamepad }) => {
  if (!gamepad.id.includes(VENDOR_ID) || !gamepad.id.includes(DEVICE_ID)) {
    return
  }

  const pressKey = key => {
    const events = ['keydown', 'keyup']
    events.forEach(e => {
      document.body.dispatchEvent(new KeyboardEvent(e, { key, bubbles: true }))
    })
  }

  let gamepadIndex = gamepad.index

  intervalID = setInterval(() => {
    const joycon = navigator.getGamepads()[gamepadIndex]

    joycon.axes.forEach((v, i) => {
      // i: 0, v: 1 > StickDown
      // i: 1, v: 1 > StickLeft
      setStickHighlight(STICK_DOCUMENT_ID[i === 0 ? STICK.DOWN : STICK.LEFT], v > 0.5)

      // i: 0, v: -1 > StickUp
      // i: 1, v: -1 > StickRight
      setStickHighlight(STICK_DOCUMENT_ID[i === 0 ? STICK.UP : STICK.RIGHT], v < -0.5)
    })

    joycon.buttons
      .map((button, index) => ({ button, index }))
      .forEach(x => {
        if (BUTTON_DOCUMENT_ID[x.index]) {
          if (x.index === BUTTON.ZL) {
            setZLHighlight(BUTTON_DOCUMENT_ID[x.index], x.button.pressed)
          } else {
            setButtonHighlight(BUTTON_DOCUMENT_ID[x.index], x.button.pressed)
          }
        }
      })
  }, 1000 / 60)
})

addEventListener('gamepaddisconnected', e => {
  if (gamepadIndex === e.gamepad.index) {
    clearInterval(intervalID)
    gamepadIndex = intervalID = null
  }
})

addEventListener('keydown', e => {
  if (
    document.activeElement.tagName === 'INPUT' &&
    !['Shift', 'Tab', 'Backspace'].includes(e.key)
  ) {
    document.activeElement.value = e.key
    e.preventDefault()
  }
})

document.getElementById('rotate-button').addEventListener('click', () => {
  const element = document.getElementById('joy-con')
  if (element.style.transform) {
    element.style.transform = ''
  } else {
    element.style.transform = 'rotate(90deg)'
  }
})

window.onload = () => {
  chrome.storage.sync.get('config', data => {
    if ('button' in data.config) {
      Object.entries(data.config.button).forEach(([key, value]) => {
        if (BUTTON_DOCUMENT_ID[key]) {
          const id = 'field-' + BUTTON_DOCUMENT_ID[key]
          document.getElementById(id).value = value
        }
      })
    }
    if ('stick' in data.config) {
      Object.entries(data.config.stick).forEach(([key, value]) => {
        if (STICK_DOCUMENT_ID[key]) {
          const id = 'field-' + STICK_DOCUMENT_ID[key]
          document.getElementById(id).value = value
        }
      })
    }
  })
}

document.getElementById('submit-button').addEventListener('click', () => {
  const stick = {}
  const button = {}
  const inputs = [...document.querySelectorAll('input')]
  inputs.forEach(e => {
    if (e.value) {
      const documentId = e.id.replace('field-', '')
      if (documentId.startsWith('stick-')) {
        Object.entries(STICK_DOCUMENT_ID).find(([key, value]) => {
          if (documentId === value) {
            stick[key] = e.value
          }
        })
      } else {
        Object.entries(BUTTON_DOCUMENT_ID).find(([key, value]) => {
          if (documentId === value) {
            button[key] = e.value
          }
        })
      }
    }
  })
  const config = { stick, button }
  chrome.storage.sync.set({ config })
})
