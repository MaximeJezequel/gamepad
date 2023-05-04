import React from "react"
import Gamepad from "./components/GamepadComponent"

const App: React.FC = () => {
  return (
    <div>
      <h2>Bluetooth Device check</h2>
      <Gamepad />
    </div>
  )
}

export default App
