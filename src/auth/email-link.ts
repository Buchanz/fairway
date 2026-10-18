/** Parse only the expected callback. Never log or display tokens from an email link. */
export function parseEmailLink(raw:string,expected:string){
 const url=new URL(raw),destination=new URL(expected);
 if(url.protocol!==destination.protocol||url.host!==destination.host||url.pathname.replace(/\/$/,'')!==destination.pathname.replace(/\/$/,''))return null;
 const params=new URLSearchParams(url.hash.slice(1));
 if(params.has('error')||url.searchParams.has('error'))throw new Error('This email link has expired or is invalid. Request another email.');
 const access_token=params.get('access_token'),refresh_token=params.get('refresh_token');
 if(!access_token&&!refresh_token)return null;
 if(!access_token||!refresh_token)throw new Error('This email link is incomplete. Request another email.');
 return {access_token,refresh_token,recovery:params.get('type')==='recovery'};
}
