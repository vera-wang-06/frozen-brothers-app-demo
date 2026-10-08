import React from 'react';
import Svg, {Path,Circle} from 'react-native-svg';
// Shared 24px outline grid keeps symbols consistent across iOS, Android and web.
const paths={
 phone:'M6 3 3 6c0 8 7 15 15 15l3-3-5-4-3 3-6-6 3-3-4-5Z',
 chat:'M3 4h18v13H8l-5 4V4ZM7 8h10M7 12h7',
 support:'M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v7H3Zm14 0h4v7h-4m4-2v4h-7',
 help:'M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',

 play:'m8 4 12 8-12 8Z',
 pause:'M8 4v16M16 4v16',
 drop:'M12 2S4 10 4 15a8 8 0 0 0 16 0c0-5-8-13-8-13Z',
 machine:'M4 3h16v18H4ZM4 13h16M8 6v4m8-4v4M8 17h8',

 mail:'M3 5h18v14H3Zm0 0 9 7 9-7',
 payment:'M3 5h18v14H3ZM3 9h18M6 15h4',
 pin:'M12 22s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Zm0-16a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
 truck:'M2 5h12v12H2Zm12 4h4l4 5v3h-8M5 17v3m14-3v3',
 check:'M5 4h14v17H5ZM8 3h8v4H8m0 7 3 3 5-6',
 up:'m6 15 6-6 6 6',
 repeat:'M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5m-3 9a9 9 0 0 0 15 2l3-3m0 5v-5h-5',

 home:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
 products:'M8 5V3h8v2M5 5h14l-2 16H7ZM9 8v9m6-9v9',
 orders:'M7 3h10l3 3v15H4V3h3m10 0v4h3M8 10h8m-8 4h8m-8 4h5',
 account:'M3 21c0-5 3-8 9-8s9 3 9 8',
 cart:'M2 3h3l3 12h11l3-9H6M8 15l-1 3h12',
 search:'m16 16 5 5',
 back:'m15 5-7 7 7 7',
 down:'m6 9 6 6 6-6',
 right:'m9 5 7 7-7 7',
 filter:'M3 6h18M3 12h18M3 18h18M8 3v6m8 0v6m-6 0v6',
 sort:'M8 3v18m-4-4 4 4 4-4M16 21V3m-4 4 4-4 4 4',
 lock:'M6 10h12v11H6Zm3 0V7a3 3 0 0 1 6 0v3',
 close:'m6 6 12 12M6 18 18 6',
};
export default function Icon({name,size=24,color='#092D49'}){if(name==='support')return <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Path d="M42 30V24.4615C42 14.2655 33.9411 6 24 6C14.0589 6 6 14.2655 6 24.4615V30" stroke="#333" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"/><Path d="M34 32C34 29.7909 35.7909 28 38 28H42V42H38C35.7909 42 34 40.2091 34 38V32Z" fill="none" stroke="#333" strokeWidth={4} strokeLinejoin="round"/><Path d="M42 32H44C45.1046 32 46 32.8954 46 34V36C46 37.1046 45.1046 38 44 38H42V32Z" fill="#333"/><Path d="M6 32H4C2.89543 32 2 32.8954 2 34V36C2 37.1046 2.89543 38 4 38H6V32Z" fill="#333"/><Path d="M6 28H10C12.2091 28 14 29.7909 14 32V38C14 40.2091 12.2091 42 10 42H6V28Z" fill="none" stroke="#333" strokeWidth={4} strokeLinejoin="round"/></Svg>;return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.45} strokeLinecap="round" strokeLinejoin="round" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Path d={paths[name]||paths.orders}/>{name==='account'&&<Circle cx="12" cy="6" r="4"/>}{name==='search'&&<Circle cx="10" cy="10" r="6"/>}{name==='cart'&&<><Circle cx="9" cy="21" r="1"/><Circle cx="18" cy="21" r="1"/></>}</Svg>}
