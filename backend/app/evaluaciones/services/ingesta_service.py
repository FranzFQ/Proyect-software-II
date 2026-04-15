from evaluaciones.parsers.ceat_parser import CEATParser
from evaluaciones.parsers.evaluacion_docente_parser import EvaluacionDocenteParser
from evaluaciones.parsers.control_docente_parser import ControlDocenteParser
from evaluaciones.parsers.pensum_parser import PensumParser
from evaluaciones.parsers.nomina_parser import NominaParser

class IngestaService:
    @staticmethod
    def procesar_ceat(archivo, semestre_actual):
        CEATParser.procesar(archivo, semestre_actual)

    @staticmethod
    def procesar_evaluacion_docente(archivo, semestre_actual):
        EvaluacionDocenteParser.procesar(archivo, semestre_actual)

    @staticmethod
    def procesar_control_docente(archivo, semestre_actual):
        ControlDocenteParser.procesar(archivo, semestre_actual)

    @staticmethod
    def procesar_pensum(archivo):
        return PensumParser.procesar(archivo)

    @staticmethod
    def procesar_nomina(archivo, semestre_actual):
        return NominaParser.procesar(archivo, semestre_actual)
