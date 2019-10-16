import React, { createContext, useContext, useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import styles from './Snackbar.css'

export const defaultPosition = 'bottom-center'
export const defaultDuration = 5000
export const defaultInterval = 250

// Context used by the custom hook useSnackbar()
const SnackbarContext = createContext(null)

export default function Snackbar({ children }) {
  // Current open state
  const [open, setOpen] = useState(false)
  // Current timeout ID
  const [timeoutId, setTimeoutId] = useState(null)
  // Snackbar's text
  const [text, setText] = useState('')
  // Snackbar's duration
  const [duration, setDuration] = useState(defaultDuration)
  // Snackbar's position
  const [position, setPosition] = useState(defaultPosition)
  // Custom styles for the snackbar itself
  const [customStyles, setCustomStyles] = useState({})
  // Custom styles for the close button
  const [closeCustomStyles, setCloseCustomStyles] = useState({})

  const triggerSnackbar = (text, duration, position, style, closeStyle) => {
    setText(text)
    setDuration(duration)
    setPosition(position)
    setCustomStyles(style)
    setCloseCustomStyles(closeStyle)
    setOpen(true)
  }

  // Manages all the snackbar's opening process
  const openSnackbar = (text, duration, position, style, closeStyle) => {
    // Closes the snackbar if it is already open
    if (open === true) {
      setOpen(false)
      setTimeout(() => {
        triggerSnackbar(text, duration, position, style, closeStyle)
      }, defaultInterval)
    } else {
      triggerSnackbar(text, duration, position, style, closeStyle)
    }
  }

  // Closes the snackbar just by setting the "open" state to false
  const closeSnackbar = () => {
    setOpen(false)
  }

  // Returns the Provider that must wrap the application
  return (
    <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar }}>
      {children}

      {/* Renders Snackbar on the end of the page */}
      <CSSTransition
        in={open}
        timeout={150}
        mountOnEnter
        unmountOnExit
        // Sets timeout to close the snackbar
        onEnter={() => {
          clearTimeout(timeoutId)
          setTimeoutId(setTimeout(() => setOpen(false), duration))
        }}
        // Sets custom classNames based on "position"
        className={`${styles['snackbar-wrapper']} ${
          styles[`snackbar-wrapper-${position}`]
        }`}
        classNames={{
          enter: `${styles['snackbar-enter']} ${styles[`snackbar-enter-${position}`]}`,
          enterActive: `${styles['snackbar-enter-active']} ${
            styles[`snackbar-enter-active-${position}`]
          }`,
          exitActive: `${styles['snackbar-exit-active']} ${
            styles[`snackbar-exit-active-${position}`]
          }`,
        }}
      >
        {/* This div will be rendered with CSSTransition classNames */}
        <div>
          <div className={styles.snackbar} style={customStyles}>
            {/* Snackbar's text */}
            <p className={styles.snackbar__text}>{text}</p>

            {/* Snackbar's close button */}
            <div
              onClick={closeSnackbar}
              className={styles.snackbar__close}
              style={closeCustomStyles}
            >
              <CloseIcon />
            </div>
          </div>
        </div>
      </CSSTransition>
    </SnackbarContext.Provider>
  )
}

// CloseIcon SVG is styled with font properties
const CloseIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 12 12">
    <path
      fill="currentColor"
      d="M11.73 1.58L7.31 6l4.42 4.42-1.06 1.06-4.42-4.42-4.42 4.42-1.06-1.06L5.19 6 .77 1.58 1.83.52l4.42 4.42L10.67.52z"
      fillRule="evenodd"
    />
  </svg>
)

// Possible snackbar's position
const positions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

// Custom hook that manages snackbar's context
// Receives snackbar's properties and wraps the openSnackbar method
export const useSnackbar = ({
  position = defaultPosition,
  style = {},
  closeStyle = {},
} = {}) => {
  const { openSnackbar, closeSnackbar } = useContext(SnackbarContext)

  // If no correct position is passed, 'bottom-center' is set
  if (!positions.includes(position)) {
    position = defaultPosition
  }

  function open(text = '', duration = defaultDuration) {
    openSnackbar(text, duration, position, style, closeStyle)
  }

  // Returns methods in hooks array way
  return [open, closeSnackbar]
}
