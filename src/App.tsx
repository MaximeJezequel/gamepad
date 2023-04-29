import React from "react"
import Gamepad from "./components/GamepadComponent"

const App: React.FC = () => {
  return (
    <div>
      <span>Bluetooth Device check</span>
      <Gamepad />
    </div>
  )
}

export default App
