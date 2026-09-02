import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'CyberVenue · El3ab',description:'Venue operations workspace for El3ab gaming venues'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" dir="ltr"><body>{children}</body></html>}
