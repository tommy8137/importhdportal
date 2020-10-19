import formSimulatorSelector from './selector'

export default __CLIENT__ || __UNIVERSAL__ ? require('./Simulator') : null

export {
  formSimulatorSelector,
}
