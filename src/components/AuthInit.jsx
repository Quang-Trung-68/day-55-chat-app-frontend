import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLazyGetMeQuery } from "@/store/api/authApi";
import { setChecked, clearUser } from "@/store/authSlice";

function AuthInit({ children }) {
    const { isChecked } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [getMe] = useLazyGetMeQuery();

    useEffect(() => {
        if (!isChecked) {
            const token = localStorage.getItem("access_token");
            if (token) {
                getMe()
                    .unwrap()
                    .catch(() => dispatch(clearUser()));
            } else {
                dispatch(setChecked());
            }
        }
    }, [dispatch, getMe, isChecked]);

    return children;
}

export default AuthInit;
