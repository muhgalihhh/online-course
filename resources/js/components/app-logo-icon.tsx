import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return <img src="logo.png" alt="Logo" className="h-48 object-contain" {...props} />;
}
