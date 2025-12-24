import * as TYPES from '@truckmitr/redux/actions/types'

const initialState = {
    driverProfileEdit: null,
}

const driverReducer = (state = initialState, action: any) => {
    const { type, payload } = action
    switch (type) {

        case TYPES['DRIVER_PROFILE_EDIT']:
            return {
                ...state,
                driverProfileEdit: payload,
            }
        default: return { ...state }
    }

}

export default driverReducer