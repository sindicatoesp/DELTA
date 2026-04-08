import { DeleteApiKeyUseCase } from "~/modules/api-keys/application/use-cases/delete-api-key";
import { GetApiKeyByIdUseCase } from "~/modules/api-keys/application/use-cases/get-api-key-by-id";
import { GetApiKeyFormDataUseCase } from "~/modules/api-keys/application/use-cases/get-api-key-form-data";
import { ListApiKeysUseCase } from "~/modules/api-keys/application/use-cases/list-api-keys";
import { SaveApiKeyUseCase } from "~/modules/api-keys/application/use-cases/save-api-key";
import { getApiKeyDb } from "~/modules/api-keys/infrastructure/db/client.server";
import { DrizzleApiKeyRepository } from "~/modules/api-keys/infrastructure/repositories/drizzle-api-key-repository.server";

function buildApiKeyRepository() {
	return new DrizzleApiKeyRepository(getApiKeyDb());
}

export function makeApiKeyRepository(): DrizzleApiKeyRepository {
	return buildApiKeyRepository();
}

export function makeListApiKeysUseCase(): ListApiKeysUseCase {
	return new ListApiKeysUseCase(buildApiKeyRepository());
}

export function makeGetApiKeyByIdUseCase(): GetApiKeyByIdUseCase {
	return new GetApiKeyByIdUseCase(buildApiKeyRepository());
}

export function makeGetApiKeyFormDataUseCase(): GetApiKeyFormDataUseCase {
	return new GetApiKeyFormDataUseCase(buildApiKeyRepository());
}

export function makeSaveApiKeyUseCase(): SaveApiKeyUseCase {
	return new SaveApiKeyUseCase(buildApiKeyRepository());
}

export function makeDeleteApiKeyUseCase(): DeleteApiKeyUseCase {
	return new DeleteApiKeyUseCase(buildApiKeyRepository());
}
