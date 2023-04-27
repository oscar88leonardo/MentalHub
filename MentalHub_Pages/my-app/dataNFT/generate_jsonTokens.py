import requests as req

for i in range(15,101):
  print('current: '+str(i))
  url = 'http://localhost:3000/api/'+str(i)+'/Member%20'+str(i)+'/url/Members/1'
  resp = req.get(url)
  print(resp.text) # Printing response
