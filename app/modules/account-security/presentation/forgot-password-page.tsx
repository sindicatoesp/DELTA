import { useNavigation, Link } from "react-router";
import { Form, Errors as FormErrors, errorToString } from "~/frontend/form";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

interface FormFields {
    email: string;
}

interface ForgotPasswordPageProps {
    csrfToken: string;
    errors?: FormErrors<FormFields>;
    successMessage?: string;
}

export function ForgotPasswordPage({
    csrfToken,
    errors = {},
    successMessage,
}: ForgotPasswordPageProps) {
    const navigation = useNavigation();
    const isSubmitting =
        navigation.state === "submitting" &&
        navigation.formData?.get("email") != null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <Card className="w-full max-w-md rounded-2xl shadow-xl p-6">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h2 className="mb-3 text-2xl font-semibold text-gray-800">
                        {"Forgot your password?"}
                    </h2>
                </div>

                <div className="mb-2 text-red-500">
                    {`* ${"Required information"}`}
                </div>

                {/* General Error */}
                {errors.general && (
                    <div className="mb-4">
                        <Message severity="error" text={errors.general} />
                    </div>
                )}

                <Form id="reset-password-form" errors={errors}>
                    <div className="flex flex-col gap-6">
                        <input
                            type="hidden"
                            name="csrfToken"
                            value={csrfToken}
                        />

                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="font-semibold text-gray-800">
                                {"Email address"}
                                <span className="text-red-500"> *</span>
                            </label>

                            <div className="p-inputgroup login-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-envelope"></i>
                                </span>
                                <InputText
                                    id="email"
                                    type="email"
                                    name="email"
                                    className="w-full"
                                    placeholder={"Enter your email"}
                                    disabled={!!successMessage}
                                    required
                                />
                            </div>

                            {errors?.fields?.email && (
                                <div className="text-sm text-red-500">
                                    {errorToString(errors.fields.email[0])}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            label={"Reset Password"}
                            icon="pi pi-envelope"
                            loading={isSubmitting}
                            disabled={!!successMessage}
                            className="w-full"
                        />

                        {/* Back Link */}
                        <div>
                            <Link
                                to="/user/login"
                                className="text-sm text-blue-600 underline hover:text-blue-800"
                            >
                                {"Back"}
                            </Link>
                        </div>

                        {/* Success */}
                        {successMessage && (
                            <div>
                                <Message
                                    severity="success"
                                    className="w-full"
                                    text={successMessage}
                                />
                            </div>
                        )}
                    </div>
                </Form>
            </Card>
        </div>
    );
}
