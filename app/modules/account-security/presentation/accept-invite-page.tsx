import { useNavigation, Form, Link } from "react-router";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { ErrorState } from "~/components/ErrorState";
import type { CompleteInviteSignupErrors } from "~/modules/account-security/domain/entities/account-security";

interface AcceptInvitePageProps {
    inviteCode: string;
    email: string;
    isValid: boolean;
    validationError?: string;
    errors?: CompleteInviteSignupErrors;
    isSetupComplete?: boolean;
}

export function AcceptInvitePage({
    inviteCode,
    email,
    isValid,
    validationError,
    errors = {},
    isSetupComplete,
}: AcceptInvitePageProps) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    if (!isValid) {
        return (
            <ErrorState
                title="Invalid Invitation"
                message={validationError || "Invalid invite code"}
            />
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
            <Card className="w-full max-w-lg rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                        {"Create your account"}
                    </h2>

                    <p className="mb-4 text-gray-600">
                        {"Create your account by filling in the required details."}
                    </p>

                    <Message
                        severity="warn"
                        className="mb-4"
                        text={`* ${"Required information"}`}
                    />
                </div>

                <Form method="post" id="reset-password-form" noValidate>
                    <div className="flex flex-col gap-6">
                        <input name="inviteCode" type="hidden" defaultValue={inviteCode} />

                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="font-semibold text-gray-800">
                                {"Email address"}
                                <span className="text-red-500"> *</span>
                            </label>

                            <InputText
                                id="email"
                                type="email"
                                name="email"
                                className="w-full"
                                placeholder={"Enter your email"}
                                readOnly
                                required
                                defaultValue={email}
                            />
                        </div>

                        {/* First Name */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="firstName" className="font-semibold text-gray-800">
                                {"First name"}
                                <span className="text-red-500"> *</span>
                            </label>

                            <InputText
                                id="firstName"
                                name="firstName"
                                className="w-full"
                                required
                                autoFocus
                                invalid={!!errors.firstName}
                            />

                            {errors.firstName && (
                                <small className="text-sm text-red-500">
                                    {errors.firstName}
                                </small>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="lastName" className="font-semibold text-gray-800">
                                {"Last name"}
                                <span className="text-red-500"> *</span>
                            </label>

                            <InputText
                                id="lastName"
                                name="lastName"
                                className="w-full"
                                required
                                invalid={!!errors.lastName}
                            />

                            {errors.lastName && (
                                <small className="text-sm text-red-500">
                                    {errors.lastName}
                                </small>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="font-semibold text-gray-800">
                                {"Password"}
                                <span className="text-red-500"> *</span>
                            </label>

                            <Password
                                id="password"
                                name="password"
                                toggleMask
                                feedback={true}
                                minLength={12}
                                required
                                invalid={!!errors.password}
                                pt={{
                                    iconField: { root: { className: "w-full" } },
                                    input: { className: "w-full" },
                                }}
                            />

                            {errors.password && (
                                <small className="text-sm text-red-500">
                                    {errors.password}
                                </small>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="passwordRepeat" className="font-semibold text-gray-800">
                                {"Confirm password"}
                                <span className="text-red-500"> *</span>
                            </label>

                            <Password
                                id="passwordRepeat"
                                name="passwordRepeat"
                                toggleMask
                                feedback={false}
                                minLength={12}
                                required
                                invalid={!!errors.passwordRepeat}
                                pt={{
                                    iconField: { root: { className: "w-full" } },
                                    input: { className: "w-full" },
                                }}
                            />

                            {errors.passwordRepeat && (
                                <small className="text-sm text-red-500">
                                    {errors.passwordRepeat}
                                </small>
                            )}
                        </div>

                        {/* Password Rules */}
                        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                            <ul className="list-disc space-y-2 pl-5">
                                <li>{"At least 12 characters long"}</li>
                                <li>
                                    {"Must include two of the following:"}
                                    <ul className="mt-2 list-disc space-y-1 pl-5">
                                        <li>{"Uppercase letters"}</li>
                                        <li>{"Lowercase letters"}</li>
                                        <li>{"Numbers"}</li>
                                        <li>{"Special characters"}</li>
                                    </ul>
                                </li>
                                <li>{"Cannot be the same as the username"}</li>
                                <li>{"Should not be a simple password"}</li>
                            </ul>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            label={"Set up account"}
                            icon="pi pi-user-plus"
                            loading={isSubmitting}
                            className="w-full"
                            disabled={!!isSetupComplete}
                        />

                        {/* Footer */}
                        <div className="space-y-4 text-center">
                            <Link
                                to="/"
                                className="text-sm text-blue-600 underline hover:text-blue-800"
                            >
                                {"Home"}
                            </Link>

                            {isSetupComplete && (
                                <>
                                    <Message
                                        severity="success"
                                        className="w-full"
                                        text={"Your account has been set up successfully. Click sign in below"}
                                    />

                                    <Link
                                        to="/user/login"
                                        className="block text-sm text-blue-600 underline hover:text-blue-800"
                                    >
                                        {"Sign in"}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
