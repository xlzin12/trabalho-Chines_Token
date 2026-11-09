import { jwtDecode } from "jwt-decode";

export const verificaTokenExpirado =
    (token: string | undefined) => {
        if (token) {
            try {
                let decodedToken = jwtDecode(token)

                if (
                    !decodedToken.exp
                    ||
                    decodedToken.exp < new Date().getTime() / 1000
                ) {
                    // token expirado
                    return true
                }
                // tudo ok
                return false
            } catch {
                // token invalido
                return true
            }
        }
        // nao tem token
        return true
    }
