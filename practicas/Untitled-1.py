#By: Ing. Juan David Zambrano Paredes 
#Actividad 1
nota = float(input("Ingrese su nota"))
if nota >= 7:
    print("Usted aprobo con", nota)
    if nota > 9.5:
        print("Usted aprobo, felicidades por su promedio de:", nota)
elif nota < 7:
    print("Usted reprobo")
