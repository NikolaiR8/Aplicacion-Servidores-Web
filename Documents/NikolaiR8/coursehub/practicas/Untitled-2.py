#By: Ing. Juan David Zambrano Paredes 
#Actividad 2
numeros = int(input("Cuantos numeros desea integrar?"))
pares = 0
suma = 0
for i in range (numeros):
    numero = int(input("Ingresar un numero"))

    if numero % 2 == 0:
        print("Es par")
        pares = pares + 1
        suma = suma + pares
print("Cantidad total de numeros pares" , pares)
print("Suma total de numeros pares" , suma)

