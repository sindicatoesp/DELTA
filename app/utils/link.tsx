import { Link, LinkProps } from "react-router";

type LangLinkProps = Omit<LinkProps, "to"> & {
	to: string;
	lang: string;
	visible?: boolean;
};

export function LangLink({
	to,
	lang,
	visible = true,
	...props
}: LangLinkProps) {
	const toPath = to.startsWith("/") ? to : `/${to}`;
	if (!visible) {
		return null;
	}
	return <Link to={toPath} {...props} />;
}
