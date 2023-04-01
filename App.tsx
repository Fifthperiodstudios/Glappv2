import { Provider } from "react-redux";
import AppContent from "./AppContent";
import store from "./Statemanagement/Store";

const App = () =>{
    return (
        <Provider store={store}>
            <AppContent />
        </Provider>
    );
};

export default App;