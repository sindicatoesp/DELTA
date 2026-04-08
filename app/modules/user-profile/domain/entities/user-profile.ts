export interface UserProfileForEdit {
	firstName: string;
	lastName: string;
}

export type UserProfileValidationErrors = {
	firstName?: string;
	lastName?: string;
};

export type UpdateUserProfileResult =
	| {
			ok: true;
	  }
	| {
			ok: false;
			data: UserProfileForEdit;
			errors: UserProfileValidationErrors;
	  };
