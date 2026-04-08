export interface UserProfileRepositoryPort {
	updateById(
		userId: string,
		data: {
			firstName: string;
			lastName: string;
		},
	): Promise<void>;
}
