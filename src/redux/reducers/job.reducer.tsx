import * as TYPES from '@truckmitr/redux/actions/types'

const initialState = {
    addJob: null,
}

const jobReducer = (state = initialState, action: any) => {
    const { type, payload } = action

    let editData = payload;
    if (typeof editData?.Preferred_Skills === 'string') {
        try {
            editData.Preferred_Skills = JSON.parse(editData.Preferred_Skills);
        } catch (e) {
            console.error("Invalid JSON string in Preferred_Skills", e);
        }
    }
    switch (type) {
        case TYPES['ADD_JOB']:
            return {
                ...state,
                addJob: payload
            }
        default: return { ...state }
    }

}

export default jobReducer