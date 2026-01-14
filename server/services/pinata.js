const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

async function pinJSONToIPFS(jsonData) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY
    },
    body: JSON.stringify({
      pinataContent: jsonData,
      pinataMetadata: {
        name: `sayless-report-${Date.now()}`
      }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata error: ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  return {
    IpfsHash: data.IpfsHash,
    PinSize: data.PinSize,
    Timestamp: data.Timestamp
  };
}

async function fetchFromIPFS(cid) {
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
  }
  
  return response.json();
}

export {
  pinJSONToIPFS,
  fetchFromIPFS
};
