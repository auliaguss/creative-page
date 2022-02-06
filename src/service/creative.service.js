import http from "../http-common"

const endPoint = "?userid=aulia";
class CreativeService {
    getAll(){
        return http.get(`/creatives${endPoint}`);
    }

    get(id){
        return http.get(`/creative-by-id${endPoint}&creativeid=${id}`, {headers: {
            'Content-Type': 'application/json',
        }});
    }

    create(data){
        return http.post(`/add-creative${endPoint}`,data)
    }

    update(data){
        return http.post(`/update-creative${endPoint}&creativeid=${data.id}`,data);
    }

    delete(id){
        return http.post(`/delete-creative${endPoint}&creativeid=${id}`);
    }
}

export default new CreativeService();