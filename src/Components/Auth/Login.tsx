import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { postLogin } from "../../Redux/actions";
import { navigate } from "raviger";
import { CardContent, Grid, CircularProgress } from "@material-ui/core";
import { TextInputField } from "../Common/HelperInputFields";
import { PublicDashboard } from "../Dashboard/PublicDashboard";
import { useTranslation } from "react-i18next";
import ReCaptcha from "react-google-recaptcha";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import LanguageSelector from "../Common/LanguageSelector";
import { RECAPTCHA_SITE_KEY } from "../../Common/env";
import get from "lodash.get";

export const Login = () => {
  const dispatch: any = useDispatch();
  const initForm: any = {
    username: "",
    password: "",
  };
  const initErr: any = {};
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState(initErr);
  const [isCaptchaEnabled, setCaptcha] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const captchaKey = RECAPTCHA_SITE_KEY ?? "";
  const { t } = useTranslation();
  // display spinner while login is under progress
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { value, name } = e.target;
    const fieldValue = Object.assign({}, form);
    const errorField = Object.assign({}, errors);
    if (errorField[name]) {
      errorField[name] = null;
      setErrors(errorField);
    }
    fieldValue[name] = value;
    if (name === "username") {
      fieldValue[name] = value.toLowerCase();
    }
    setForm(fieldValue);
  };

  const validateData = () => {
    let hasError = false;
    const err = Object.assign({}, errors);
    Object.keys(form).forEach((key) => {
      if (
        typeof form[key] === "string" &&
        key !== "password" &&
        key !== "confirm"
      ) {
        if (!form[key].match(/\w/)) {
          hasError = true;
          err[key] = t("field_required");
        }
      }
      if (!form[key]) {
        hasError = true;
        err[key] = t("field_required");
      }
    });
    if (hasError) {
      setErrors(err);
      return false;
    }
    return form;
  };

  // set loading to false when component is dismounted
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const valid = validateData();
    if (valid) {
      // replaces button with spinner
      setLoading(true);

      dispatch(postLogin(valid)).then((resp: any) => {
        const res = get(resp, "data", null);
        const statusCode = get(resp, "status", "");
        if (res && statusCode === 429) {
          setCaptcha(true);
          // captcha displayed set back to login button
          setLoading(false);
        } else if (res && statusCode === 200) {
          localStorage.setItem("care_access_token", res.access);
          localStorage.setItem("care_refresh_token", res.refresh);

          if (
            window.location.pathname === "/" ||
            window.location.pathname === "/login"
          ) {
            navigate("/facility");
          } else {
            navigate(window.location.pathname.toString());
          }
          window.location.reload();
        } else {
          // error from server set back to login button
          setLoading(false);
        }
      });
    }
  };

  const onCaptchaChange = (value: any) => {
    if (value && isCaptchaEnabled) {
      const formCaptcha = { ...form };
      formCaptcha["g-recaptcha-response"] = value;
      setForm(formCaptcha);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:h-screen relative">
      <div className="md:absolute top-2 right-2 p-2 md:p-0 bg-primary-500 md:bg-white">
        <LanguageSelector className="md:bg-primary-500 md:text-white bg-white" />
      </div>
      <div className="flex flex-col justify-center md:w-1/2 md:h-full bg-primary-500 border-primary-500">
        <div className="pl-1/5">
          <a href={"/"}>
            <img
              src={process.env.REACT_APP_LIGHT_LOGO}
              className="h-8 w-auto"
              alt="care logo"
            />{" "}
          </a>
        </div>
        <div className="mt-4 md:mt-20 rounded-lg px-1/5 py-4">
          <PublicDashboard />
        </div>
      </div>

      <div className="flex items-center justify-center w-full my-4 md:mt-0 md:w-1/2 md:h-full">
        <div className="bg-white mt-4 md:mt-20 px-4 py-4">
          <div className="text-2xl font-bold text-center pt-4 text-primary-600">
            {t("auth_login_title")}
          </div>
          <form onSubmit={handleSubmit}>
            <div>
              <TextInputField
                name="username"
                label={t("username")}
                variant="outlined"
                margin="dense"
                autoFocus={true}
                InputLabelProps={{ shrink: true }}
                value={form.username}
                onChange={handleChange}
                errors={errors.username}
              />
              <div className="relative w-full">
                <TextInputField
                  className="w-full"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  label={t("password")}
                  variant="outlined"
                  margin="dense"
                  autoComplete="off"
                  InputLabelProps={{ shrink: true }}
                  value={form.password}
                  onChange={handleChange}
                  errors={errors.password}
                />
                {showPassword ? (
                  <VisibilityIcon
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-4"
                  />
                ) : (
                  <VisibilityOffIcon
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-4"
                  />
                )}
              </div>
              <Grid container justify="center">
                {isCaptchaEnabled && (
                  <Grid item className="px-8 py-4">
                    <ReCaptcha
                      sitekey={captchaKey}
                      onChange={onCaptchaChange}
                    />
                    <span className="text-red-500">{errors.captcha}</span>
                  </Grid>
                )}

                <div className="w-full flex justify-between items-center pb-4">
                  <a
                    href="/forgot-password"
                    className="text-sm text-primary-400 hover:text-primary-500"
                  >
                    {t("forget_password")}
                  </a>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center">
                    <CircularProgress className="text-primary-500" />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-primary-500 inline-flex items-center justify-center text-sm font-semibold py-2 px-4 rounded cursor-pointer text-white"
                  >
                    {t("login")}
                  </button>
                )}
              </Grid>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
