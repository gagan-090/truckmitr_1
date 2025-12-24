import { combineReducers } from 'redux';
import userReducer from '@truckmitr/redux/reducers/user.reducer';
import jobReducer from '@truckmitr/redux/reducers/job.reducer';
import driverReducer from '@truckmitr/redux/reducers/driver.reducer';

const appReducer = combineReducers({
    user: userReducer,
    job: jobReducer,
    driver: driverReducer
})

const rootReducer = (state: any, action: any) => {
    return appReducer(state, action)
}

export default rootReducer